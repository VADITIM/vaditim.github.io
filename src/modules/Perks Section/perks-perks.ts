
export const skills = [
	{ name: 'C# Developer', id: ['11', '12'] },
	{ name: 'Vue & Typescript', id: ['21', '22'] },
	{ name: 'UI/UX Animator', id: ['31', '32'] },
	{ name: 'Game Designer', id: ['41', '42'] },
	{ name: 'Technical Designer', id: ['51', '52'] },
]

export const skillOptions = [
	{ id: '11', name: 'Unity & Godot' },
	{ id: '12', name: 'Apps & Games' },

	{ id: '21', name: 'Component Architecture' },
	{ id: '22', name: 'API Integration' },

	{ id: '31', name: 'Vivid Motions' },
	{ id: '32', name: 'Seemless Navigation' },

	{ id: '41', name: 'Fun Experience' },
	{ id: '42', name: 'Meaningful Systems' },

	{ id: '51', name: 'Quick Prototyping' },
	{ id: '52', name: 'System Integration' },
]

export function GetOptionName(id: string) {
	const option = skillOptions.find(opt => opt.id === id)
	return option ? option.name : ''
}
