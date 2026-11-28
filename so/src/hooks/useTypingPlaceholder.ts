import { useEffect, useState } from 'react';

export function useTypingPlaceholder(
  value: string,
  examples: readonly string[],
  active = true
) {
  const [placeholder, setPlaceholder] = useState('');

  useEffect(() => {
    if (!active || value.length > 0 || examples.length === 0) {
      setPlaceholder('');
      return;
    }

    let exampleIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timer = 0;

    const tick = () => {
      const example = examples[exampleIndex];
      characterIndex += deleting ? -1 : 1;
      setPlaceholder(example.slice(0, characterIndex));

      let delay = deleting ? 45 : 85;
      if (!deleting && characterIndex === example.length) {
        deleting = true;
        delay = 1100;
      } else if (deleting && characterIndex === 0) {
        deleting = false;
        exampleIndex = (exampleIndex + 1) % examples.length;
        delay = 350;
      }

      timer = window.setTimeout(tick, delay);
    };

    timer = window.setTimeout(tick, 300);
    return () => window.clearTimeout(timer);
  }, [active, value, examples]);

  return active && value.length === 0 ? placeholder : '';
}
