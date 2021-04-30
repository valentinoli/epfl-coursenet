import {
  schemeCategory10,
  schemeDark2,
  schemePaired,
  schemeSet1,
  schemeTableau10,
  // interpolateSpectral,
  interpolateTurbo,
} from 'd3-scale-chromatic'
import { scaleSequentialQuantile } from 'd3-scale'

function hexToRgb(hex) {
  // https://stackoverflow.com/a/5624139/8238129
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [
        parseInt(result[1], 16), // r
        parseInt(result[2], 16), // g
        parseInt(result[3], 16), // b
      ]
    : null
}

function textColor(bgColor) {
  // https://stackoverflow.com/a/3943023/8238129
  let rgb
  if (bgColor.startsWith('#')) {
    // hex
    rgb = hexToRgb(bgColor)
  } else {
    // rgb(r, g, b)
    rgb = bgColor
      .slice(bgColor.indexOf('(') + 1, bgColor.indexOf(')'))
      .replace(/\s/g, '')
      .split(',')
  }

  const [r, g, b] = rgb

  if (r * 0.299 + g * 0.587 + b * 0.114 > 186) {
    return '#000000'
  }

  return '#ffffff'
}

const mapColorEntry = ([k, color, label]) => [
  k,
  { color, textColor: textColor(color), label },
]

function createColorMap(keys, colors, labels = null) {
  if (!labels) labels = keys
  return Object.fromEntries(
    keys.map((k, idx) => [k, colors[idx], labels[idx]]).map(mapColorEntry)
  )
}

export function getColorMaps({ credits: creditsValues, semester, section }) {
  // Credits: sequential coloring
  const creditsColors = scaleSequentialQuantile(interpolateTurbo).domain(
    creditsValues
  )
  const credits = createColorMap(creditsValues, creditsColors.range())

  // Semester: thematic coloring
  // Assume alphabetic order of values in `semesters` array
  // any: cyan darken-1
  // fall: brown darken-1
  // spring: amber darken-1
  const semesterColors = ['#00ACC1', '#6D4C41', '#FFB300']
  const semesters = createColorMap(semester, semesterColors)

  // Section: categorical coloring
  // Slice grey colors
  const sectionColors = [
    ...schemeCategory10.slice(0, -3),
    ...schemeDark2.slice(0, -1),
    ...schemePaired,
    ...schemeSet1.slice(0, -1),
    ...schemeTableau10.slice(0, -1),
  ]
  const sections = createColorMap(section, sectionColors)

  // Neighborhoods: grayscale coloring
  const hoods = ['incoming', 'outgoing', 'incomingOutgoing']
  const hoodColors = ['#D3D3D3', '#000000', '#808080']
  const hoodLabels = ['Incoming', 'Outgoing', 'Incoming & Outgoing']
  const neighborhood = createColorMap(hoods, hoodColors, hoodLabels)

  const red = '#FF0000'
  const blue = '#0000FF'
  return {
    credits,
    semester: semesters,
    section: sections,
    uniform: {
      color: red,
      textColor: textColor(red),
      label: 'Course',
    },
    bipartition: {
      lecturers: {
        color: blue,
        textColor: textColor(blue),
        label: 'Lecturer',
      },
      courses: {
        color: red,
        textColor: textColor(red),
        label: 'Course',
      },
    },
    neighborhood,
  }
}

export default {
  getColorMaps,
}
