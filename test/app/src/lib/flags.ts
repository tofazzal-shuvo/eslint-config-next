type Mode = 'list' | 'grid';

export const describeMode = (mode: Mode) => {
  const ready = mode === 'list';
  switch (mode) {
    case 'list':
      return ready;
  }
  return false;
};
