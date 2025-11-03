// A lightweight Early‑Modern‑English stylizer for Discord roleplay.
export function toOldeEnglish(input, { style = 'plain' } = {}) {
	let s = String(input ?? '');

	// preserveCase: preserve capitalization of first letter(s)
	function preserveCase(orig, replacement) {
		if (orig === orig.toUpperCase()) return replacement.toUpperCase();
		if (orig[0] === orig[0].toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1);
		return replacement;
	}

	// contraction replacements (small, illustrative set)
	const contractions = [
		[/\bI'm\b/gi, 'I am'],
		[/\bI've\b/gi, 'I have'],
		[/\byou've\b/gi, 'you have'],
		[/\byou'll\b/gi, 'you will'],
		[/\bdon't\b/gi, 'do not'],
		[/\bcan't\b/gi, 'cannot']
	];
	contractions.forEach(([re, rep]) => { s = s.replace(re, rep); });

	// Object pronouns before general replacements (prefer "thee" after prepositions)
	const preps = ['to','for','with','at','by','from','about','as','into','like','through','after','over','between','out','against','during','without','before','under','around','among'];
	preps.forEach(p => {
		const re = new RegExp(`\\b${p} you\\b`, 'gi');
		s = s.replace(re, `${p} thee`);
	});

	// Your → thy / thine (before vowel)
	s = s.replace(/\byour\s+([aeiouh])/gi, (_m, v) => `thine ${v}`);
	s = s.replace(/\byour\b/gi, 'thy');
	s = s.replace(/\byours\b/gi, 'thine');
	s = s.replace(/\byourself\b/gi, 'thyself');

	// 2nd person verb pairs
	s = s.replace(/\byou are\b/gi, 'thou art');
	s = s.replace(/\bare you\b/gi, 'art thou');
	s = s.replace(/\byou were\b/gi, 'thou wast');
	s = s.replace(/\bwere you\b/gi, 'wast thou');

	s = s.replace(/\bdo you\b/gi, 'dost thou');
	s = s.replace(/\byou do\b/gi, 'thou dost');
	s = s.replace(/\bdid you\b/gi, 'didst thou');
	s = s.replace(/\bhave you\b/gi, 'hast thou');
	s = s.replace(/\byou have\b/gi, 'thou hast');
	s = s.replace(/\bwill you\b/gi, 'wilt thou');
	s = s.replace(/\bshall you\b/gi, 'shalt thou');
	s = s.replace(/\bcan you\b/gi, 'canst thou');
	s = s.replace(/\bshould you\b/gi, 'shouldst thou');
	s = s.replace(/\bwould you\b/gi, 'wouldst thou');
	s = s.replace(/\bcould you\b/gi, 'couldst thou');
	s = s.replace(/\bmay you\b/gi, 'mayst thou');
	s = s.replace(/\bmust you\b/gi, 'must thou');

	// General pronouns
	s = s.replace(/\byou\b/gi, (m) => preserveCase(m, 'thou'));

	// Common archaic verb forms (3rd person)
	s = s.replace(/\bdoes\b/gi, 'doth');
	s = s.replace(/\bdoeth\b/gi, 'doth'); // safety
	s = s.replace(/\bhas\b/gi, 'hath');

	// Flavor words
	s = s.replace(/\bvery\b/gi, 'right');
	s = s.replace(/\breally\b/gi, 'verily');
	s = s.replace(/\bhello\b/gi, 'hail');
	s = s.replace(/\bhi\b/gi, 'hail');
	s = s.replace(/\bgoodbye\b/gi, 'fare thee well');
	s = s.replace(/\bfriend\b/gi, 'good sir');

	// Light -eth heuristic for simple "he/she/it VERB" cases (avoid auxiliaries)
	s = s.replace(/\b(he|she|it)\s+([a-z]{3,})(?!eth)\b/gi, (_m, subj, verb) => {
		const aux = ['is','are','am','was','were','be','been','being','do','does','did','have','has','had','will','shall','can','may','must','should','would','could'];
		if (aux.includes(verb.toLowerCase())) return `${subj} ${verb}`;
		// remove trailing s/es first
		let base = verb.replace(/(es|s)$/, '');
		if (base === verb) {
			return `${subj} ${verb}eth`;
		} else {
			return `${subj} ${base}eth`;
		}
	});

	// Optional bardic prefix
	if (style === 'bardic') {
		const openers = ['Prithee,', 'Forsooth,', 'Verily,', 'Hark,', 'Lo,'];
		const opener = openers[ Math.floor(Math.random()*openers.length) ];
		s = `${opener} ${s}`;
	}

	return s;
}