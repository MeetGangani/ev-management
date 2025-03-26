import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

// Animation variants for skeleton loading
const skeletonVariants = {
  initial: { opacity: 0.5 },
  animate: { 
    opacity: [0.5, 0.8, 0.5],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "easeInOut",
    }
  }
};

// Base Skeleton component with pulse animation
const SkeletonBase = ({ className = '', height = '1rem', width = '100%', rounded = 'rounded-md' }) => {
  return (
    <motion.div
      variants={skeletonVariants}
      initial="initial"
      animate="animate"
      className={`bg-slate-700/50 ${rounded} ${className}`}
      style={{ height, width }}
    />
  );
};

// Text line skeleton for paragraph text
export const SkeletonText = ({ lines = 3, className = '', lineHeight = '1rem', width = '100%', lastLineWidth = '75%' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase 
          key={i} 
          height={lineHeight} 
          width={i === lines - 1 && lastLineWidth ? lastLineWidth : width} 
          className="my-1"
          rounded="rounded"
        />
      ))}
    </div>
  );
};

// Card skeleton for card layouts
export const SkeletonCard = ({ 
  className = '', 
  height = '12rem', 
  width = '100%', 
  hasImage = true, 
  imageHeight = '8rem',
  hasFooter = true,
  footerHeight = '2rem',
  contentLines = 2,
  hasHeader = true,
  headerHeight = '1.5rem'
}) => {
  return (
    <div className={`card-glass border border-primary-600/20 shadow-glass overflow-hidden ${className}`} style={{ height: 'auto', width }}>
      {hasImage && (
        <SkeletonBase height={imageHeight} width="100%" rounded="rounded-t-lg" />
      )}
      <div className="p-4 space-y-3">
        {hasHeader && (
          <SkeletonBase height={headerHeight} width="70%" rounded="rounded" />
        )}
        {contentLines > 0 && (
          <SkeletonText lines={contentLines} lineHeight="0.875rem" lastLineWidth="50%" />
        )}
      </div>
      {hasFooter && (
        <div className="px-4 pb-4">
          <SkeletonBase height={footerHeight} width="100%" rounded="rounded" />
        </div>
      )}
    </div>
  );
};

// Table skeleton for data tables
export const SkeletonTable = ({ 
  className = '', 
  rows = 5, 
  columns = 4, 
  hasHeader = true,
  cellHeight = '2.5rem',
  headerHeight = '3rem'
}) => {
  return (
    <div className={`w-full overflow-hidden border border-primary-600/20 rounded-lg ${className}`}>
      {hasHeader && (
        <div className="border-b border-primary-600/20 bg-slate-800/50" style={{ height: headerHeight }}>
          <div className="grid gap-4 px-4 py-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <SkeletonBase key={i} height="1.5rem" rounded="rounded" />
            ))}
          </div>
        </div>
      )}
      <div className="divide-y divide-primary-600/10">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            className="grid gap-4 px-4 items-center bg-slate-800/30 hover:bg-slate-700/30 transition-colors"
            style={{ 
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              height: cellHeight
            }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonBase 
                key={colIndex} 
                height="1rem" 
                width={colIndex === 0 ? '70%' : '90%'} 
                rounded="rounded"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Avatar skeleton for user profiles
export const SkeletonAvatar = ({ 
  size = 'md', 
  className = ''
}) => {
  const sizeMap = {
    sm: '2rem',
    md: '3rem',
    lg: '5rem',
    xl: '8rem'
  };
  
  const actualSize = sizeMap[size] || size;
  
  return (
    <SkeletonBase 
      height={actualSize} 
      width={actualSize} 
      rounded="rounded-full" 
      className={className} 
    />
  );
};

// Button skeleton
export const SkeletonButton = ({ 
  width = '8rem', 
  height = '2.5rem', 
  className = '' 
}) => {
  return (
    <SkeletonBase 
      height={height} 
      width={width} 
      rounded="rounded-full" 
      className={className} 
    />
  );
};

// Form field skeleton
export const SkeletonFormField = ({ 
  hasLabel = true, 
  labelWidth = '30%', 
  inputHeight = '2.5rem', 
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {hasLabel && (
        <SkeletonBase 
          height="1rem" 
          width={labelWidth} 
          rounded="rounded" 
          className="mb-1" 
        />
      )}
      <SkeletonBase 
        height={inputHeight} 
        width="100%" 
        rounded="rounded-md" 
      />
    </div>
  );
};

// Stats card skeleton
export const SkeletonStats = ({ 
  columns = 4, 
  className = '' 
}) => {
  return (
    <div 
      className={`grid gap-6 ${className}`}
      style={{ gridTemplateColumns: `repeat(${Math.min(columns, 4)}, 1fr)` }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="card-glass border border-primary-600/20 shadow-glass p-4">
          <SkeletonBase height="1rem" width="50%" rounded="rounded" className="mb-2" />
          <SkeletonBase height="2rem" width="70%" rounded="rounded" className="mb-4" />
          <SkeletonBase height="0.875rem" width="90%" rounded="rounded" />
        </div>
      ))}
    </div>
  );
};

// Dashboard skeleton 
export const SkeletonDashboard = ({ className = '' }) => {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header area */}
      <div className="flex justify-between items-center">
        <SkeletonBase height="2rem" width="12rem" rounded="rounded-md" />
        <div className="flex space-x-4">
          <SkeletonButton width="6rem" />
          <SkeletonButton width="6rem" />
        </div>
      </div>
      
      {/* Stats row */}
      <SkeletonStats columns={4} />
      
      {/* Main content area with 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <SkeletonCard height="20rem" hasImage={false} contentLines={0} hasHeader />
          <SkeletonTable rows={5} columns={4} />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <SkeletonCard height="12rem" hasImage={false} contentLines={3} />
          <SkeletonCard height="16rem" hasImage={false} contentLines={5} />
        </div>
      </div>
    </div>
  );
};

// PropTypes
SkeletonBase.propTypes = {
  className: PropTypes.string,
  height: PropTypes.string,
  width: PropTypes.string,
  rounded: PropTypes.string
};

SkeletonText.propTypes = {
  lines: PropTypes.number,
  className: PropTypes.string,
  lineHeight: PropTypes.string,
  width: PropTypes.string,
  lastLineWidth: PropTypes.string
};

SkeletonCard.propTypes = {
  className: PropTypes.string,
  height: PropTypes.string,
  width: PropTypes.string,
  hasImage: PropTypes.bool,
  imageHeight: PropTypes.string,
  hasFooter: PropTypes.bool,
  footerHeight: PropTypes.string,
  contentLines: PropTypes.number,
  hasHeader: PropTypes.bool,
  headerHeight: PropTypes.string
};

SkeletonTable.propTypes = {
  className: PropTypes.string,
  rows: PropTypes.number,
  columns: PropTypes.number,
  hasHeader: PropTypes.bool,
  cellHeight: PropTypes.string,
  headerHeight: PropTypes.string
};

SkeletonAvatar.propTypes = {
  size: PropTypes.oneOfType([
    PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
    PropTypes.string
  ]),
  className: PropTypes.string
};

SkeletonButton.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  className: PropTypes.string
};

SkeletonFormField.propTypes = {
  hasLabel: PropTypes.bool,
  labelWidth: PropTypes.string,
  inputHeight: PropTypes.string,
  className: PropTypes.string
};

SkeletonStats.propTypes = {
  columns: PropTypes.number,
  className: PropTypes.string
};

SkeletonDashboard.propTypes = {
  className: PropTypes.string
}; 