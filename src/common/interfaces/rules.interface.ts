import { EntitiesOfRule } from "src/modules/ability/ability.system";

export interface Rules {
	manage?: EntitiesOfRule;
	create?: EntitiesOfRule;
	read?: EntitiesOfRule;
	update?: EntitiesOfRule;
	delete?: EntitiesOfRule;
}