import {
  DeleteObjectCommand,
  S3Client,
  ListObjectsCommand,
} from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'AKIA4QKV7RLRKSFL5TP4',
    secretAccessKey: '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',
  },
});

// console.log(process.env.AWS_SECRET_ACCESS_KEY);

export const deleteS3Object = async (bucketParams) => {
  try {
    const data = await s3Client.send(new DeleteObjectCommand(bucketParams));

    // console.log('Success. Object deleted.', data);
    return data; // For unit tests.
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    console.log({ requestId, cfId, extendedRequestId });
  }
};
