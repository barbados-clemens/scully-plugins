module.exports = {
  name: 'scully-plugin-header-links',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/scully-plugin-header-links',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
