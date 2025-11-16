import { useEffect } from 'react'

const MetaData = ({ title }) => {
  useEffect(() => {
    const nextTitle = `${title} - Nourishy`;
    try {
      if (typeof document !== 'undefined') {
        document.title = nextTitle;
      }
    } catch (_) {
      // no-op: safely ignore title set errors in non-DOM environments
    }
  }, [title]);

  return null;
}

export default MetaData