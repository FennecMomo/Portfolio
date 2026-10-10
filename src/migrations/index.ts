import * as migration_20261010_091206_initial from './20261010_091206_initial';

export const migrations = [
  {
    up: migration_20261010_091206_initial.up,
    down: migration_20261010_091206_initial.down,
    name: '20261010_091206_initial'
  },
];
