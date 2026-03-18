const checkIfNearBottom = (
  scrollElement: HTMLElement,
  threshold: number = 50,
) => {
  const { scrollTop, scrollHeight, clientHeight } = scrollElement;
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

  return distanceFromBottom <= threshold;
};

export default checkIfNearBottom;
