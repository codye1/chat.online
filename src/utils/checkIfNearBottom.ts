const checkIfNearBottom = (
  scrollElement: HTMLElement,
  threshold: number = 10,
) => {
  const { scrollTop, scrollHeight, clientHeight } = scrollElement;
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

  return distanceFromBottom <= threshold;
};

export default checkIfNearBottom;
