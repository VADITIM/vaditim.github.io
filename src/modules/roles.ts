
export const skills = [
	{ name: 'C# Developer', id: ['11', '12', '13'] },
	{ name: 'Vue & Typescript', id: ['21', '22', '23'] },
	{ name: 'UI/UX Animator', id: ['31', '32', '33'] },
	{ name: 'Game Designer', id: ['31', '32', '33'] },
	{ name: 'Technical Designer', id: ['31', '32', '33'] },
]

export const skillOptions = [
	{ id: '11', name: 'Unity & Godot' },
	{ id: '12', name: 'Apps & Games' },
	{ id: '13', name: 'Option' },

	{ id: '21', name: 'Component Architecture' },
	{ id: '22', name: 'API Integration' },
	{ id: '23', name: 'Option' },

	{ id: '31', name: 'Option' },
	{ id: '32', name: 'Option' },
	{ id: '33', name: 'Option' },
]

export function GetOptionName(id: string) {
	const option = skillOptions.find(opt => opt.id === id)
	return option ? option.name : ''
}
