import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
// /jobKey stym
// / bucket key = api
const client = new LambdaClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  })

export async function getS3Link(params) {
  const command = new InvokeCommand({
  FunctionName: 'arn:aws:lambda:us-east-1:859710655202:function:AWS-create-zip',
  InvocationType: 'Event',
  Payload: {
    // bucketName: 'stymconnectappbucket130953-dev',
    bucketKey: params.bucketKey,
    jobKey: params.jobKey,
  },
});
 try {
   const data = await client.send(command);
  // console.log(data, 'data')
 } catch (error) {
   // error handling.
   console.log(error)
 } finally {
  console.log('are you kidding me')
 }
}


// const response = await handler.send(command);

// console.log(response, 'response');

// export default handler