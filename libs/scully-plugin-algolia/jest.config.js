module.exports = {
  name: 'scully-plugin-algolia',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/scully-plugin-algolia',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
