export default function ({ $axios, redirect, error }) {
  $axios.onError((e) => {
    // Allow request cancelling
    if (!$axios.isCancel(e)) {
      const code = parseInt(e.response && e.response.status)
      if (code === 404) {
        redirect('/not-found')
      } else if (code >= 500) {
        redirect('/sorry')
      } else {
        error(e)
      }
    }
  })
}
