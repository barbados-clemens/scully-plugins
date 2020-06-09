module.exports = {
  name: 'scully-plugin-blur-up-images',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/scully-plugin-blur-up-images',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
