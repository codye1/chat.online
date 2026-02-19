import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import styles from "./PreviewItem.module.css";

const PreviewItemSkeleton = () => {
  return (
    <div className={styles.previewItem}>
      <div className={styles.icon}>
        <Skeleton
          circle
          width={50}
          height={50}
          baseColor="var(--c-border)"
          highlightColor="var(--c-hover)"
        />
      </div>
      <div className={styles.details}>
        <div className={styles.mainInfo}>
          <h2>
            <Skeleton
              width={120}
              height={20}
              baseColor="var(--c-border)"
              highlightColor="var(--c-hover)"
            />
          </h2>
          <p>
            <Skeleton
              width={180}
              height={16}
              baseColor="var(--c-border)"
              highlightColor="var(--c-hover)"
            />
          </p>
        </div>

        <div className={styles.meta}>
          <p>
            <Skeleton
              width={40}
              height={14}
              baseColor="var(--c-border)"
              highlightColor="var(--c-hover)"
            />
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreviewItemSkeleton;
