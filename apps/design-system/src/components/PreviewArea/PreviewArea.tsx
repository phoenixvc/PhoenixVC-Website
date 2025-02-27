import React from "react";
//@ts-ignore
import styles from "./previewArea.module.css";

const PreviewArea: React.FC = () => {
  return (
    <main className={styles.previewArea}>
      <div className={styles.previewControls}>
        <button className={styles.btn}>Desktop</button>
        <button className={styles.btn}>Tablet</button>
        <button className={styles.btn}>Mobile</button>
      </div>
      <div className={styles.previewDevice}>
        <div className={styles.previewHeader}>
          <h1>Preview Area</h1>
        </div>
        <div className={styles.previewContent}>
          <div className={styles.componentPreview}>
            <h2>Button Styles</h2>
            <button className={styles.btn}>Primary Button</button>
            <button className={`${styles.btn} ${styles.btnSecondary}`}>Secondary Button</button>
            <button className={`${styles.btn} ${styles.btnAccent}`}>Accent Button</button>
          </div>
          <div className={styles.componentPreview}>
            <h2>Typography</h2>
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <p>
              Regular paragraph text with <a href="#" className={styles.link}>links</a> and <strong>bold text</strong>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PreviewArea;
