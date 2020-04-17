const AWS = require('aws-sdk');
// const awsAccessKeyID = 'AKIAZJEQXOQ33CRSG35L';
// const awsSecretAccessKey = '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';
// const bucketName = 'mugnimaestra-general-bucket';
// const regionName = 'ap-southeast-1';
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION_NAME,
});

const params = {
  Bucket: process.env.AWS_BUCKET_NAME,
  Key: 'subsList',
}

// s3.getObject(params, (err, data) => {
//   if (err) console.log(err, err.stack);
//   else {
//     console.log(data.Body.toString('utf-8'));
//     data = JSON.parse(data.Body.toString('utf-8'));
//     console.log(data);
//   }
// })

function getSubList() {
  let data = [];
  s3.getObject(params, (err, data) => {
    if (err) console.log(err, err.stack);
    else {
      data = JSON.parse(data.Body.toString('utf-8'));
    }
  })
  return data;
}

function postSubList(subList) {
  const upload = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: 'subsList',
    Body: subList,
  }
  s3.upload(params, (err, data) => {
    if (err) console.log(err, err.stack);
    else {
      console.log('file uploaded');
    }
  })
}

module.exports = {
  getSubList,
  postSubList,
};
