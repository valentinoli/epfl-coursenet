import Graph from '@/utils/graph'
import { fillColor, voronoiColor } from '@/utils/graph-colors'

export default ({ app }, inject) => {
  inject('graph', Graph)
  inject('nodeFillColor', fillColor)
  inject('nodeVoronoiColor', voronoiColor)
}
