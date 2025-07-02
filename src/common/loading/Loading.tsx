import { motion } from "framer-motion";
import styles from "./Loading.module.css";

export default function LoadingSpinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className={styles.spinner}
    />
  );
}
