import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import { CLIENT_ID, REDIRECT_URI } from '..';

const AUTH_ENDPOINT = "https://accounts.spotify.com/api/token"

type Data = {
  lyrics: Record<string, number>;
}

export default async function auth(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const response = await axios.post(AUTH_ENDPOINT, {
    grant_type: "client_credentials"
  }, {
    headers: {
      Authorization: "Basic " + (new Buffer(CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  return res.status(200).json(response.data);
}
