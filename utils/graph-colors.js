export function fillColor(cmap, nodeColorParam, d) {
  if (nodeColorParam) {
    return cmap[nodeColorParam][d[nodeColorParam]].color
  }

  return cmap.uniform.color
}

export function voronoiColor(cmap, nodeGroupParam, d) {
  if (nodeGroupParam) {
    return cmap[nodeGroupParam][d[nodeGroupParam]].color
  }

  return 'inherit'
}
