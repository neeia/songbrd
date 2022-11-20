import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import { CLIENT_ID } from '..';
import Cors from 'cors'
import useCors from 'util/useCors';

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET'],
})


const AUTH_ENDPOINT = "https://accounts.spotify.com/api/token"

type Data = {
  lyrics: Record<string, number>;
}
type Request = {
  token: string;
}

export default async function (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await useCors(req, res, cors);

  const q = req.query as Request;
  const response = await axios.post(AUTH_ENDPOINT, {
    refresh_token: q.token,
    grant_type: "refresh_token"
  }, {
    headers: {
      Authorization: "Basic " + (new Buffer(CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  return res.status(200).json(response.data);
}
