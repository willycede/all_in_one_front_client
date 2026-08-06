export function buildCategoryOptions(categories = []) {
	const byId = new Map(
		categories.map((category) => [String(category.id_category), category])
	);
	const parentIds = new Set(
		categories
			.filter((category) => category.id_parent_category)
			.map((category) => String(category.id_parent_category))
	);

	const categoryPath = (category, visited = new Set()) => {
		const id = String(category.id_category);
		if (visited.has(id) || !category.id_parent_category) {
			return category.name;
		}
		const parent = byId.get(String(category.id_parent_category));
		if (!parent) {
			return category.name;
		}
		const nextVisited = new Set(visited);
		nextVisited.add(id);
		return `${categoryPath(parent, nextVisited)} › ${category.name}`;
	};

	return categories
		.filter((category) => !parentIds.has(String(category.id_category)))
		.map((category) => ({
			...category,
			display_name: categoryPath(category),
		}))
		.sort((a, b) => a.display_name.localeCompare(b.display_name));
}
