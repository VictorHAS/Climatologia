import React from "react";
import styles from "../../styles/Spinner.module.css";

const Spinner = () => {
  return (
    <div className={`${styles.loader}`}>
      <div className={`${styles.sk_chase}`}>
        <div className={styles.sk_chase_dot}></div>
        <div className={styles.sk_chase_dot}></div>
        <div className={styles.sk_chase_dot}></div>
        <div className={styles.sk_chase_dot}></div>
        <div className={styles.sk_chase_dot}></div>
        <div className={styles.sk_chase_dot}></div>
      </div>
    </div>
  );
};
export default Spinner;
