/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable security/detect-object-injection */

import { nanoid } from 'nanoid';
import { writeFileSync, readFileSync, existsSync } from 'fs';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

export default class Cruder {
  constructor(fileUrl) {
    const dir = dirname(fileUrl);

    this.cwd = fileURLToPath(dir);
    this.storagePath = `${this.cwd}/data.json`;

    if (!existsSync(this.storagePath)) {
      this.writeContent([]);
    }
  }

  writeContent(data) {
    return writeFileSync(this.storagePath, JSON.stringify(data));
  }

  getContents() {
    const raw = readFileSync(this.storagePath, 'utf8');
    return JSON.parse(raw);
  }

  // --

  insert(data) {
    const records = this.getContents();

    const newEntry = {
      ...data,
      id: data.id || nanoid(),
    };

    records.push(newEntry);
    this.writeContent(records);

    return newEntry;
  }

  read(id, prop = 'id') {
    const records = this.getContents();
    const result = records.filter((rec) => rec[prop] === id);

    return result.length ? result[0] : null;
  }

  update(id, data) {
    const records = this.getContents();
    const hotIndex = records.findIndex((rec) => rec.id === id);

    if (hotIndex > -1) {
      records[hotIndex] = { ...records[hotIndex], ...data };
      this.writeContent(records);

      return records[hotIndex];
    }

    return null;
  }

  del(id) {
    const records = this.getContents();
    const hotIndex = records.findIndex((rec) => rec.id === id);

    if (hotIndex > -1) {
      records.splice(hotIndex, 1);
      this.writeContent(records);

      return true;
    }

    return false;
  }

  list(filter = {}) {
    const records = this.getContents();

    const result = records.filter((rec) => {
      const propMatches = Object
        .keys(filter)
        .map((key) => rec[key] === filter[key]);

      return propMatches.every((prop) => prop === true);
    });

    return result;
  }
}
