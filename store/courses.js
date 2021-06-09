export const state = () => ({
  courses: [],
})

export const mutations = {
  push({ courses }, { slug, name, code }) {
    const existingIdx = courses.findIndex((c) => c.slug === slug)
    // prepend new course
    courses.splice(0, 0, { slug, name, code })

    if (existingIdx !== -1) {
      // remove existing course from its old position
      // idx + 1 to account for the prepended course
      courses.splice(existingIdx + 1, 1)
    } else if (courses.length > 10) {
      // remove last course if length exceeds the limit
      courses.splice(courses.length - 1, 1)
    }
  },
  remove({ courses }, slug) {
    // remove course from array
    courses.splice(
      courses.findIndex((c) => c.slug === slug),
      1
    )
  },
}
