import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

type AnimatedTextProps = {
  words: string[];
  interval?: number;
};
const AnimatedText = ({ words, interval }: AnimatedTextProps) => {
  // State for index
  const [index, setIndex] = useState(0);

  //   Side effect for words rewrite
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);

    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span
      className="relative inline-flex items-center"
      style={{ minWidth: "12ch" }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="left-0 right-0 top-0 bottom-0"
        >
          {" "}
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default AnimatedText;
