const fs = require('fs');
const file = 'src/app/u/[username]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace {galleryPhotos.length > 0 && (...)} with animated version
const oldGalleryStr = '{galleryPhotos.length > 0 && (\n          <motion.div variants={staggerItem} className="w-full select-none">';
const newGalleryStr = `{galleryPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-10%" }}
            className="w-full select-none"
          >`;
code = code.replace(oldGalleryStr, newGalleryStr);

// Replace {videos.length > 0 && (...)} with animated version
const oldVideoStr = '{videos.length > 0 && (\n          <motion.div variants={staggerItem} className="w-full select-none flex flex-col gap-3">';
const newVideoStr = `{videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-10%" }}
            className="w-full select-none flex flex-col gap-3"
          >`;
code = code.replace(oldVideoStr, newVideoStr);

// Also need to add whileInView to the HERO section
const oldHeroStr = '{/* HERO SECTION */}\n        <motion.div \n          variants={staggerItem} \n          className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-b-3xl md:rounded-3xl shadow-2xl group"';
const newHeroStr = `{/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-10%" }}
          className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-b-3xl md:rounded-3xl shadow-2xl group"`;
code = code.replace(oldHeroStr, newHeroStr);

// Also add whileInView to the Performances section
const oldPerfStr = '{Object.keys(processedPerformances).length > 0 && selectedDiscipline && processedPerformances[selectedDiscipline] && (\n          <motion.div variants={staggerItem} className="w-full flex flex-col gap-6 select-none">';
const newPerfStr = `{Object.keys(processedPerformances).length > 0 && selectedDiscipline && processedPerformances[selectedDiscipline] && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-10%" }}
            className="w-full flex flex-col gap-6 select-none"
          >`;
code = code.replace(oldPerfStr, newPerfStr);


// Remove Old Réseaux block if it's still there
const oldSocialTitle = 'Réseaux & Sources';
const titleIdx = code.indexOf(oldSocialTitle);
if (titleIdx !== -1) {
    const startDiv = '<motion.div variants={staggerItem} className="flex flex-col gap-3 w-full select-none">';
    const blockStart = code.lastIndexOf(startDiv, titleIdx);

    if (blockStart !== -1) {
      let depth = 0;
      let blockEnd = -1;
      let searchStr = code.substring(blockStart);

      const openTag = '<motion.div';
      const closeTag = '</motion.div>';
      let i = 0;

      while (i < searchStr.length) {
        if (searchStr.substring(i, i + openTag.length) === openTag) {
          depth++;
          i += openTag.length;
        } else if (searchStr.substring(i, i + closeTag.length) === closeTag) {
          depth--;
          if (depth === 0) {
            blockEnd = blockStart + i + closeTag.length;
            break;
          }
          i += closeTag.length;
        } else {
          i++;
        }
      }

      if (blockEnd !== -1) {
        const condStart = '{links.length > 0 && (';
        const condStartIdx = code.lastIndexOf(condStart, blockStart);
        const condEnd = ')}';
        const condEndIdx = code.indexOf(condEnd, blockEnd);

        if (condStartIdx !== -1 && condEndIdx !== -1 && (blockStart - condStartIdx < 50) && (condEndIdx - blockEnd < 10)) {
           code = code.substring(0, condStartIdx) + code.substring(condEndIdx + condEnd.length);
        } else {
           code = code.substring(0, blockStart) + code.substring(blockEnd);
        }
      }
    }
}

// Remove empty <div id="performances" className="w-full"></div> anchor tags since user said they aren't needed.
code = code.replace('<div id="performances" className="w-full"></div>\n        ', '');
code = code.replace('<div id="medias" className="w-full"></div>\n        ', '');


fs.writeFileSync(file, code);
