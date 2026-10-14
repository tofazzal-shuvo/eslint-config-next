import _ from 'lodash';

interface Item {
  value: any;
  items: number[];
}

class Store {}

export const messy = ({ value, items }: Item, flag: boolean) => {
  console.log(value!.x, new Store());
  let size = value as number;
  for (const item of items) size += item;
  items.push(size);
  value.count = 1;
  delete value.old;
  if (flag) {
    if (size > 1) {
      if (size > 2) {
        return null;
      }
    }
    return size;
  } else {
    return flag ? (size ? 'a' : 'b') : 'c';
  }
};

function localHelper() {
  return _.uniq([1]);
}

export const used = localHelper();
