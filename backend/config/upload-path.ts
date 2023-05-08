import * as path from 'path';

const UPLOAD_DIRECTORY = 'upload';
const ROOT_DIRECTORY = path.resolve(__dirname, '../..');
const UPLOAD_PATH = path.join(ROOT_DIRECTORY, UPLOAD_DIRECTORY) + '/';

export default UPLOAD_PATH;
