import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

// Variants for animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.5
    }
  }
};

// Bar Chart Component
export const AnimatedBarChart = ({ 
  data, 
  labels, 
  title, 
  color = 'accent-blue',
  animationDuration = 1.5,
  height = 300,
  horizontal = false,
  className = '',
  showLegend = false,
  showGridLines = true,
  yAxisLabel = '',
  xAxisLabel = '',
  barThickness = 30
}) => {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Generate gradient colors based on theme color
  const getGradientColors = () => {
    const baseColors = {
      'accent-blue': ['rgba(56, 189, 248, 0.9)', 'rgba(56, 189, 248, 0.3)'],
      'accent-teal': ['rgba(45, 212, 191, 0.9)', 'rgba(45, 212, 191, 0.3)'],
      'accent-purple': ['rgba(168, 85, 247, 0.9)', 'rgba(168, 85, 247, 0.3)'],
      'accent-yellow': ['rgba(251, 191, 36, 0.9)', 'rgba(251, 191, 36, 0.3)'],
      'accent-red': ['rgba(248, 113, 113, 0.9)', 'rgba(248, 113, 113, 0.3)']
    };
    
    return baseColors[color] || baseColors['accent-blue'];
  };

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy previous chart instance if it exists
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    // Create gradient fill
    const ctx = chartRef.current.getContext('2d');
    const [gradientColor1, gradientColor2] = getGradientColors();
    
    let gradient;
    if (horizontal) {
      gradient = ctx.createLinearGradient(0, 0, 300, 0);
    } else {
      gradient = ctx.createLinearGradient(0, 300, 0, 0);
    }
    gradient.addColorStop(0, gradientColor2);
    gradient.addColorStop(1, gradientColor1);
    
    // Define chart config
    const chartConfig = {
      type: horizontal ? 'bar' : 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: title,
          data: isVisible ? data : data.map(() => 0), // Start with zero values
          backgroundColor: gradient,
          borderColor: gradientColor1,
          borderWidth: 1,
          borderRadius: 4,
          barThickness: barThickness
        }]
      },
      options: {
        indexAxis: horizontal ? 'y' : 'x',
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: animationDuration * 1000
        },
        plugins: {
          legend: {
            display: showLegend,
            labels: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: 'rgba(255, 255, 255, 0.9)',
            bodyColor: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: showGridLines,
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)'
            },
            title: {
              display: yAxisLabel !== '',
              text: horizontal ? xAxisLabel : yAxisLabel,
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          x: {
            grid: {
              display: showGridLines && !horizontal,
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)'
            },
            title: {
              display: xAxisLabel !== '',
              text: horizontal ? yAxisLabel : xAxisLabel,
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        }
      }
    };
    
    // Create new chart instance
    const newChartInstance = new Chart(ctx, chartConfig);
    setChartInstance(newChartInstance);
    
    // Set timeout to trigger animation
    setTimeout(() => {
      setIsVisible(true);
      newChartInstance.data.datasets[0].data = data;
      newChartInstance.update();
    }, 300);
    
    // Cleanup function
    return () => {
      if (newChartInstance) {
        newChartInstance.destroy();
      }
    };
  }, [data, labels, title, color, animationDuration, horizontal, showLegend, showGridLines, yAxisLabel, xAxisLabel, barThickness]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`card-glass border border-primary-600/20 shadow-glass p-4 ${className}`}
    >
      {title && <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>}
      <div style={{ height: `${height}px` }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </motion.div>
  );
};

// Line Chart Component
export const AnimatedLineChart = ({ 
  data, 
  labels, 
  title, 
  color = 'accent-blue',
  animationDuration = 1.5,
  height = 300,
  className = '',
  showLegend = false,
  showGridLines = true,
  yAxisLabel = '',
  xAxisLabel = '',
  tension = 0.4,
  fill = true
}) => {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  
  // Generate colors based on theme color
  const getColors = () => {
    const baseColors = {
      'accent-blue': ['rgba(56, 189, 248, 1)', 'rgba(56, 189, 248, 0.3)'],
      'accent-teal': ['rgba(45, 212, 191, 1)', 'rgba(45, 212, 191, 0.3)'],
      'accent-purple': ['rgba(168, 85, 247, 1)', 'rgba(168, 85, 247, 0.3)'],
      'accent-yellow': ['rgba(251, 191, 36, 1)', 'rgba(251, 191, 36, 0.3)'],
      'accent-red': ['rgba(248, 113, 113, 1)', 'rgba(248, 113, 113, 0.3)']
    };
    
    return baseColors[color] || baseColors['accent-blue'];
  };

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy previous chart instance if it exists
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    // Create gradient fill
    const ctx = chartRef.current.getContext('2d');
    const [lineColor, fillColor] = getColors();
    
    let gradient = null;
    if (fill) {
      gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, fillColor);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    
    // Define chart config
    const chartConfig = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: title,
          data: data,
          borderColor: lineColor,
          backgroundColor: gradient,
          borderWidth: 2,
          pointBackgroundColor: lineColor,
          pointBorderColor: 'rgba(255, 255, 255, 0.8)',
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: tension,
          fill: fill
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: animationDuration * 1000
        },
        plugins: {
          legend: {
            display: showLegend,
            labels: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: 'rgba(255, 255, 255, 0.9)',
            bodyColor: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: showGridLines,
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)'
            },
            title: {
              display: yAxisLabel !== '',
              text: yAxisLabel,
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          x: {
            grid: {
              display: showGridLines,
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)'
            },
            title: {
              display: xAxisLabel !== '',
              text: xAxisLabel,
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        }
      }
    };
    
    // Create new chart instance
    const newChartInstance = new Chart(ctx, chartConfig);
    setChartInstance(newChartInstance);
    
    // Cleanup function
    return () => {
      if (newChartInstance) {
        newChartInstance.destroy();
      }
    };
  }, [data, labels, title, color, animationDuration, showLegend, showGridLines, yAxisLabel, xAxisLabel, tension, fill]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`card-glass border border-primary-600/20 shadow-glass p-4 ${className}`}
    >
      {title && <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>}
      <div style={{ height: `${height}px` }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </motion.div>
  );
};

// Pie/Doughnut Chart Component
export const AnimatedPieChart = ({ 
  data, 
  labels, 
  title, 
  colors = ['accent-blue', 'accent-teal', 'accent-purple', 'accent-yellow', 'accent-red'],
  animationDuration = 1.5,
  height = 300,
  className = '',
  showLegend = true,
  doughnut = false,
  cutout = 50
}) => {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  
  // Generate colors array from theme colors
  const getColorsArray = () => {
    const colorMap = {
      'accent-blue': 'rgba(56, 189, 248, 0.9)',
      'accent-teal': 'rgba(45, 212, 191, 0.9)',
      'accent-purple': 'rgba(168, 85, 247, 0.9)',
      'accent-yellow': 'rgba(251, 191, 36, 0.9)',
      'accent-red': 'rgba(248, 113, 113, 0.9)',
      'green': 'rgba(74, 222, 128, 0.9)',
      'orange': 'rgba(251, 146, 60, 0.9)',
      'pink': 'rgba(244, 114, 182, 0.9)',
      'indigo': 'rgba(129, 140, 248, 0.9)'
    };
    
    // For each color in the colors array, map to the corresponding rgba value
    return colors.map(color => colorMap[color] || colorMap['accent-blue']);
  };

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy previous chart instance if it exists
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    const colorValues = getColorsArray();
    const borderColors = colorValues.map(color => color.replace('0.9', '1'));
    
    // Define chart config
    const chartConfig = {
      type: doughnut ? 'doughnut' : 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colorValues,
          borderColor: borderColors,
          borderWidth: 1,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: doughnut ? `${cutout}%` : 0,
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: animationDuration * 1000
        },
        plugins: {
          legend: {
            display: showLegend,
            position: 'bottom',
            labels: {
              padding: 20,
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: 'rgba(255, 255, 255, 0.9)',
            bodyColor: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    };
    
    // Create new chart instance
    const newChartInstance = new Chart(chartRef.current, chartConfig);
    setChartInstance(newChartInstance);
    
    // Cleanup function
    return () => {
      if (newChartInstance) {
        newChartInstance.destroy();
      }
    };
  }, [data, labels, title, colors, animationDuration, doughnut, showLegend, cutout]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`card-glass border border-primary-600/20 shadow-glass p-4 ${className}`}
    >
      {title && <h3 className="text-lg font-semibold mb-4 text-center text-white">{title}</h3>}
      <div style={{ height: `${height}px` }} className="flex items-center justify-center">
        <canvas ref={chartRef}></canvas>
      </div>
    </motion.div>
  );
};

// PropTypes for all chart components
const baseChartPropTypes = {
  data: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  title: PropTypes.string,
  animationDuration: PropTypes.number,
  height: PropTypes.number,
  className: PropTypes.string,
  showLegend: PropTypes.bool,
  showGridLines: PropTypes.bool,
  yAxisLabel: PropTypes.string,
  xAxisLabel: PropTypes.string
};

AnimatedBarChart.propTypes = {
  ...baseChartPropTypes,
  color: PropTypes.string,
  horizontal: PropTypes.bool,
  barThickness: PropTypes.number
};

AnimatedLineChart.propTypes = {
  ...baseChartPropTypes,
  color: PropTypes.string,
  tension: PropTypes.number,
  fill: PropTypes.bool
};

AnimatedPieChart.propTypes = {
  data: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  title: PropTypes.string,
  colors: PropTypes.array,
  animationDuration: PropTypes.number,
  height: PropTypes.number,
  className: PropTypes.string,
  showLegend: PropTypes.bool,
  doughnut: PropTypes.bool,
  cutout: PropTypes.number
}; 