module.exports = {
  name: 'scully-plugin-firebase-likes',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/scully-plugin-firebase-likes',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
