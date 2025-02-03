import PropTypes from "prop-types";
import logo from "/logo.png";

export function Logo({ width = 100, height = 100, alt = "Logo" }) {
  return <img src={logo} width={width} height={height} alt={alt} />;
}

Logo.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  alt: PropTypes.string,
};
