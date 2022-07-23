import * as AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: 'AKIA4QKV7RLRKSFL5TP4',
  secretAccessKey: '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',
  region: 'us-east-1',
});

const s3 = new AWS.S3();

export const getS3File = async (key) => {
  try {
    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: 'stymconnectappbucket130953-dev',
      Key: key,
      Expires: 3600,
    });
    return url;
  } catch (error) {
    console.log(error);
  }
};
