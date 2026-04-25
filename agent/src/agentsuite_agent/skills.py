from __future__ import annotations

from pathlib import Path

import yaml

from .models import ProcessType, SkillDefinition


def _split_frontmatter(content: str) -> tuple[dict, str]:
    lines = content.splitlines()
    if not lines or lines[0].strip() != "---":
        raise ValueError("Skill file is missing YAML frontmatter.")

    end_index = None
    for index in range(1, len(lines)):
        if lines[index].strip() == "---":
            end_index = index
            break

    if end_index is None:
        raise ValueError("Skill file has unterminated YAML frontmatter.")

    metadata = yaml.safe_load("\n".join(lines[1:end_index])) or {}
    body = "\n".join(lines[end_index + 1 :]).strip()
    return metadata, body


class SkillRepository:
    def __init__(self, skills_dir: Path):
        self.skills_dir = skills_dir
        self._skills = self._load_skills()

    def _load_skills(self) -> dict[str, SkillDefinition]:
        skills: dict[str, SkillDefinition] = {}
        for path in sorted(self.skills_dir.glob("*.md")):
            metadata, body = _split_frontmatter(path.read_text(encoding="utf-8"))
            skill = SkillDefinition(
                skill_id=metadata["skill_id"],
                process=ProcessType(metadata["process"]),
                purpose=metadata["purpose"],
                required_inputs=metadata.get("required_inputs", []),
                decision_rules=metadata.get("decision_rules", []),
                approval_requirements=metadata.get("approval_requirements", []),
                output_contract=metadata.get("output_contract", []),
                failure_modes=metadata.get("failure_modes", []),
                body=body,
            )
            skills[skill.skill_id] = skill
        return skills

    def by_process(self, process: ProcessType) -> list[SkillDefinition]:
        return [skill for skill in self._skills.values() if skill.process == process]

