import PropTypes from 'prop-types';

const Button = ({ 
  color = '', 
  fn, 
  classes = '', 
  text, 
  disabled = false 
}) => {
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    if (!disabled && fn) {
      fn();
    }
  };

  return (
    <button 
      type="button"
      className={`
        ${classes} 
        transition-all duration-200 
        hover:opacity-80 
        active:scale-95 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{ 
        backgroundColor: color, 
        zIndex: 999 
      }}
      onClick={handleClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

Button.propTypes = {
  color: PropTypes.string,
  fn: PropTypes.func,
  classes: PropTypes.string,
  text: PropTypes.string.isRequired,
  disabled: PropTypes.bool
};

export default Button;