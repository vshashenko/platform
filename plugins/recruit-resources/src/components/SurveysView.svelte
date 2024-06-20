<script lang="ts">
  import surveys, { SurveyElement } from '@hcengineering/surveys'
  import { Component, getCurrentResolvedLocation, navigate } from '@hcengineering/ui'
  import recruit from '../plugin'
  import { getClient } from '@hcengineering/presentation'
  import { buildFilterKey, setFilters } from '@hcengineering/view-resources'
  import { Filter } from '@hcengineering/view'
  import { selectedSurveyElements } from '@hcengineering/surveys-resources'
  
  function setFilterTag (survey: SurveyElement) {
    const client = getClient()
    const hierarchy = client.getHierarchy()
    const attribute = hierarchy.getAttribute(recruit.mixin.Candidate, 'surveys')
    const key = buildFilterKey(hierarchy, recruit.mixin.Candidate, '_class', attribute)
    const filter = {
      key,
      value: [survey._id],
      props: { level: 0 },
      modes: [surveys.filter.FilterSurveysIn, surveys.filter.FilterSurveysNin],
      mode: surveys.filter.FilterSurveysIn,
      index: 1
    } as unknown as Filter
    setFilters([filter])
  }
  async function onSurvey (survey: SurveyElement): Promise<void> {
    selectedSurveyElements.set([survey._id])
    const loc = getCurrentResolvedLocation()
    loc.path[2] = 'recruit'
    loc.path[3] = 'talents'
    loc.path.length = 4
    navigate(loc)
    setTimeout(() => {
      setFilterTag(survey)
    }, 200)
  }
  
</script>
<Component
  is={surveys.component.SurveysView}
  props={{
    targetClass: recruit.mixin.Candidate,
    title: recruit.string.SurveyLabel,
    icon: recruit.icon.Surveys,
    item: recruit.string.SurveyLabel,
    key: 'surveys',
    сreateItemLabel: recruit.string.SurveyCreateLabel,
    onSurvey
  }}
>
</Component>
