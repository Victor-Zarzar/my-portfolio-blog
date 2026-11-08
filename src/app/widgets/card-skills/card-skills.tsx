import { getSkillsData } from "@/app/shared/data/getSkillsData";
import { Card, CardContent } from "@/app/shared/ui/card";

export default function CardSkills() {
  const categories = getSkillsData();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {categories.map((category) => {
        const CategoryIcon = category.icon;

        return (
          <Card key={category.title}>
            <CardContent className="flex flex-col items-center gap-4 pt-6">
              <div className="flex flex-col items-center gap-2 pb-2 border-b border-border w-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-800 dark:bg-neutral-800 border border-neutral-700">
                  <CategoryIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-sm tracking-tight">
                  {category.title}
                </h3>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {category.skills.map((skill) => {
                  const SkillIcon = skill.icon;
                  return (
                    <span
                      key={skill.text}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-white px-2.5 py-1 rounded-full bg-neutral-800 dark:bg-neutral-800 border border-neutral-700"
                    >
                      <SkillIcon className="w-3 h-3" />
                      {skill.text}
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
