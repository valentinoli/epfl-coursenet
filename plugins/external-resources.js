export default ({ app, env }, inject) => {
  const appName = env.appName.replace(' ', '-')
  const querystring = `?origin=${env.baseUrl}&app-name=${appName}&message=thank-you&contact=valentin.loftsson@epfl.ch`
  inject(
    'specIconURL',
    (value) =>
      `https://isa.epfl.ch/images/gestacplus/etu/plan_fiche/ic-orientation-${value}.gif${querystring}`
  )

  inject(
    'peopleImgURL',
    (sciper) =>
      `https://people.epfl.ch/private/common/photos/links/${sciper}.jpg${querystring}`
  )

  inject('peopleURL', (sciper) => `https://people.epfl.ch/${sciper}`)
}
