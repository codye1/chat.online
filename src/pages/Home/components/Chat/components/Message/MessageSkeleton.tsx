import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const MessageSkeleton = ({
  alignRight,
  height,
  width,
}: {
  alignRight: boolean;
  height: number;
  width: number;
}) => {
  return (
    <div
      style={{
        margin: "5px 0",
        maxWidth: "50%",
        marginLeft: alignRight ? "auto" : 0,
      }}
    >
      <Skeleton
        width={width}
        height={height}
        baseColor="var(--c-border)"
        highlightColor="var(--c-hover)"
      />
    </div>
  );
};

export default MessageSkeleton;
