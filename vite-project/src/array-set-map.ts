export class ArraySetMap<K, V> {
  private _store = new Map<K, V[]>();
  private static _empty = Object.freeze([]);

  get(key: K): readonly V[] {
    return this._store.get(key) ?? ArraySetMap._empty;
  }

  add(key: K, value: V): boolean {
    const values = this._store.get(key);
    if (values) {
      if (values.includes(value)) {
        return false;
      }
      values.push(value);
    } else {
      this._store.set(key, [value]);
    }

    return true;
  }

  addMany(key: K, values: readonly V[]): number {
    if (values.length === 0) return 0;

    const existing = this._store.get(key);
    if (!existing) {
      this._store.set(key, values.slice());
      return values.length;
    }

    let added = 0;
    for (const value of values) {
      if (!existing.includes(value)) {
        existing.push(value);
        added++;
      }
    }

    return added;
  }

  delete(key: K, value?: V): boolean {
    if (!value) {
      return this._store.delete(key);
    }

    const values = this._store.get(key);
    if (!values) return false;

    const idx = values.indexOf(value);
    if (idx === -1) return false;

    values.splice(idx, 1);
    if (values.length === 0) {
      this._store.delete(key);
    }

    return true;
  }
}
