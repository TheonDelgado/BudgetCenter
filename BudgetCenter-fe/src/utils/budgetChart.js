const DEFAULT_CHART_SELECTOR = '#apex-multiple-column-charts'
const chartInstances = new Map()

function toCurrencyCompact(value) {
  const numericValue = Number(value) || 0

  if (Math.abs(numericValue) >= 1000) {
    return `$${(numericValue / 1000).toFixed(1)}k`
  }

  return `$${numericValue.toFixed(2)}`
}

export function renderChart({
  monthLabels = [],
  budgetAmounts = [],
  spentAmounts = [],
  primarySeriesData,
  secondarySeriesData,
  lineSeriesData = null,
  primarySeriesName = 'Money Spent',
  secondarySeriesName = 'Budget',
  lineSeriesName = 'Total Monthly Budget',
  colors = ['var(--color-success)', 'var(--color-primary)'],
  lineSeriesColor = 'var(--color-warning)',
  goalLines = [],
  selector = DEFAULT_CHART_SELECTOR,
} = {}) {
  const existingChart = chartInstances.get(selector)
  if (existingChart?.destroy) {
    existingChart.destroy()
    chartInstances.delete(selector)
  }

  const chartElement = document.querySelector(selector)
  if (!chartElement) return null

  chartElement.innerHTML = ''

  const categories = Array.isArray(monthLabels) && monthLabels.length ? monthLabels : ['No Data']
  const resolvedPrimarySeries = primarySeriesData ?? spentAmounts
  const resolvedSecondarySeries = secondarySeriesData ?? budgetAmounts
  const firstSeries = categories.map((_, index) => Number(resolvedPrimarySeries?.[index]) || 0)
  const secondSeries = categories.map((_, index) => Number(resolvedSecondarySeries?.[index]) || 0)
  const hasLineSeries = Array.isArray(lineSeriesData)
  const thirdSeries = hasLineSeries ? categories.map((_, index) => Number(lineSeriesData?.[index]) || 0) : []

  const series = [
    {
      name: primarySeriesName,
      data: firstSeries,
      type: 'bar'
    },
    {
      name: secondarySeriesName,
      data: secondSeries,
      type: 'bar'
    }
  ]

  if (hasLineSeries) {
    series.push({
      name: lineSeriesName,
      data: thirdSeries,
      type: 'line'
    })
  }

  const chartColors = hasLineSeries ? [...colors, lineSeriesColor] : colors
  const validGoalLines = Array.isArray(goalLines)
    ? goalLines.filter((goalLine) => Number.isFinite(Number(goalLine?.value)))
    : []

  const goalLineAnnotations = validGoalLines.map((goalLine) => ({
    y: Number(goalLine.value),
    borderColor: goalLine.color || 'var(--color-neutral)',
    strokeDashArray: 6,
    label: {
      borderColor: goalLine.color || 'var(--color-neutral)',
      style: {
        color: '#fff',
        background: goalLine.color || 'var(--color-neutral)',
        fontSize: '10px',
        fontWeight: 600,
      },
      text: `${goalLine.name || 'Goal'}: ${toCurrencyCompact(goalLine.value)}`,
    },
  }))

  const seriesMaxValue = Math.max(0, ...firstSeries, ...secondSeries, ...(hasLineSeries ? thirdSeries : []))
  const goalMaxValue = Math.max(0, ...validGoalLines.map((goalLine) => Number(goalLine.value) || 0))
  const chartMaxValue = Math.max(seriesMaxValue, goalMaxValue)
  const yAxisMax = chartMaxValue > 0 ? Math.ceil(chartMaxValue * 1.1) : 100

  const chartInstance = buildChart(selector, () => ({
    chart: {
      type: 'bar',
      height: 400,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    series,
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '12px',
        borderRadius: 0
      }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        useSeriesColors: true
      },
      markers: {
        shape: 'circle'
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: chartColors,
    stroke: {
      width: hasLineSeries ? [0, 0, 3] : [0, 0],
      curve: 'smooth'
    },
    markers: {
      size: hasLineSeries ? [0, 0, 3] : [0, 0]
    },
    annotations: {
      yaxis: goalLineAnnotations
    },
    xaxis: {
      categories,
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      crosshairs: {
        show: false
      },
      labels: {
        style: {
          colors: 'var(--color-base-content)',
          fontSize: '12px',
          fontWeight: 400
        }
      }
    },
    yaxis: {
      min: 0,
      max: yAxisMax,
      labels: {
        align: 'left',
        minWidth: 0,
        maxWidth: 140,
        style: {
          colors: 'var(--color-base-content)',
          fontSize: '12px',
          fontWeight: 400
        },
        formatter: value => toCurrencyCompact(value)
      }
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
          value: 0.9
        }
      }
    },
    tooltip: {
      y: {
        formatter: value => toCurrencyCompact(value)
      },
      custom: function (props) {
        const categories = props.w?.config?.xaxis?.categories || []
        const { dataPointIndex } = props
        const title = categories[dataPointIndex] || ''
        const newTitle = `${title}`

        const helperCompatibleProps = {
          ...props,
          ctx: {
            opts: props.w?.config || {}
          }
        }

        return buildTooltip(helperCompatibleProps, {
          title: newTitle,
          hasTextLabel: true,
          wrapperExtClasses: 'min-w-28',
          labelDivider: ':',
          labelExtClasses: 'ms-2'
        })
      }
    },
    responsive: [
      {
        breakpoint: 568,
        options: {
          chart: {
            height: 300
          },
          plotOptions: {
            bar: {
              columnWidth: '4px'
            }
          },
          labels: {
            style: {
              fontSize: '10px',
              colors: 'var(--color-base-content)'
            },
            offsetX: -2,
            formatter: title => title.slice(0, 3)
          },
          yaxis: {
            labels: {
              align: 'left',
              minWidth: 0,
              maxWidth: 140,
              style: {
                fontSize: '10px',
                colors: 'var(--color-base-content)'
              },
              formatter: value => toCurrencyCompact(value)
            }
          }
        }
      }
    ]
  }))

  chartInstances.set(selector, chartInstance)

  return chartInstance
}

export function destroyChart(selector = DEFAULT_CHART_SELECTOR) {
  const chartInstance = chartInstances.get(selector)
  if (chartInstance?.destroy) {
    chartInstance.destroy()
    chartInstances.delete(selector)
  }

  const chartElement = document.querySelector(selector)
  if (chartElement) {
    chartElement.innerHTML = ''
  }
}