import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from 'react';
import { server } from "config";

interface Code {
  code: string;
}

const Callback: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      const { code } = router.query as unknown as Code;

      fetch(`${server}/api/auth?${new URLSearchParams({ code })}`).then(res => {
        res.json().then(json => {
          router.replace({
            pathname: "/",
            query: json
          })
        })
      })
    } 
  }, [router])

  return null;
}
export default Callback;