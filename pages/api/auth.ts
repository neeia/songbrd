import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import { CLIENT_ID, REDIRECT_URI } from '..';

const AUTH_ENDPOINT = "https://accounts.spotify.com/api/token"

type Data = {
  lyrics: Record<string, number>;
}
type Request = {
  code: string;
}

export default async function (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const q = req.query as Request;
  const response = await axios.post(AUTH_ENDPOINT, {
    code: q.code,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code"
  }, {
    headers: {
      Authorization: "Basic " + (new Buffer(CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  return res.status(200).json(response.data);
}
