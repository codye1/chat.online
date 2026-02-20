const vwToPx = (vw: number) => {
  return window.innerWidth * (vw / 100);
};

export default vwToPx;
