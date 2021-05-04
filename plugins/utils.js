export default ({ app, $axios, env }, inject) => {
  inject(
    'camelCaseTransform',
    (string) =>
      string.charAt(0).toUpperCase() +
      string.replace(/([a-z])([A-Z])/, '$1 $2').slice(1)
  )

  inject(
    'defaultProfileImg',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48cGF0aCBkPSJNMTAyLjQzIDEyNC41M1MxMDUuNSAxNTIgMTI4IDE1MnMyNS41Ny0yNy40NiAyNS41Ny0yNy40NiA0Ljg1IDEgNy4xOS05LjI4YzEuNS02LjctLjUtOC40OS0xLjc2LTguNDloLTEuMkMxNjMuNjggNzQuMjggMTQwIDY0IDEyOCA2NHMtMzUuNjggMTAuMjgtMjkuOCA0Mi43Nkg5N2MtMS4yNiAwLTMuMjYgMS43OS0xLjc2IDguNDkgMi4zNCAxMC4zMyA3LjE5IDkuMjggNy4xOSA5LjI4ek0xNzAuMzYgMTY0Yy0yMC4yNi0zLjg5LTI0LjM0LTgtMjUuMS0xMS42NGEyOS4xNSAyOS4xNSAwIDAgMS0zNC41MiAwYy0uNzQgMy42NC00Ljg0IDcuNzItMjUuMSAxMS42NC0yMC44NSA0LTIwLjU3IDIxLjE4LTIwLjU3IDI0aDEyNS44NmMwLTIuODUuMjgtMjAtMjAuNTctMjR6Ii8+PC9zdmc+Cg=='
  )

  inject('fetchSimlinks', async function (threshold, slugs) {
    return await $axios.$post('/simlinks', {
      threshold,
      slugs,
    })
  })

  inject('appName', env.appName)
}
