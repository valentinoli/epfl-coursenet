export const state = () => ({
  courses: [],
})

export const mutations = {
  push({ courses }, course) {
    const { slug } = course
    const existing = courses.find((c) => c.slug === slug)
    if (!existing) {
      // prepend new course
      courses.splice(0, 0, course)
      if (courses.length > 10) {
        // remove last course if length exceeds the limit
        courses.splice(courses.length - 1, 1)
      }
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
