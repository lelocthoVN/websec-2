import requests
from bs4 import BeautifulSoup
import json
import re


def get_groups_id(link_to_inst, course_start, course_end):
    group_and_id = []
    for course in range(course_start, course_end+1):
        path = link_to_inst + f"?course={course}"
        response = requests.get(path)
        if response.status_code >= 300:
            print(f"SKIPPED COURSE {course}")
        soup = BeautifulSoup(response.text, "html.parser")
        group_a_elements = soup.findAll('a', class_="btn-text group-catalog__group")
        for group_element in group_a_elements:
            group = group_element.text
            group = group.replace(" ", "")
            group_id = group_element.attrs['href'].split('groupId=')[1]
            group_and_id.append({'id': group_id, 'group': group})
    return group_and_id


def get_all_faculty(rasp_link):
    list_of_faculties = []
    path = rasp_link
    response = requests.get(path)
    if response.status_code >= 300:
        raise AssertionError("https://ssau.ru/rasp is not reachable")
    soup = BeautifulSoup(response.text, "html.parser")
    faculties_items = soup.findAll("div", class_="card-default faculties__item")
    for faculty_item in faculties_items:
        children_a = faculty_item.findChildren("a", recursive=False)[0]
        faculty_id = children_a.attrs['href'].split('faculty/')[1]
        faculty_id = faculty_id.split('?course')[0]
        list_of_faculties.append({'id': faculty_id, 'faculty': children_a.text})
    return list_of_faculties


def get_all_staff(staff_link, start_page, end_page):
    list_of_staff = []
    for page in range(start_page, end_page+1):
        path = staff_link + f"?page={page}"
        response = requests.get(path)
        if response.status_code >= 300:
            print(f"SKIPPED STAFF PAGE {page}")
        soup = BeautifulSoup(response.text, "html.parser")
        list_items = soup.findAll('li', class_="list-group-item list-group-item-action")
        for list_item in list_items:
            children_a = list_item.findChildren("a", recursive=False)[0]
            staff_id = children_a.attrs['href'].split('/staff/')[1]
            staff_id = staff_id.split('-')[0]
            staff_fio = children_a.text.replace('\n', '')
            list_of_staff.append({'id': staff_id, 'fio': staff_fio})
    return list_of_staff


def get_week_schedule_by_rows(link, group_id=None, staff_id=None, week_number=None):
    # path = link + f"?groupId={group_id}&selectedWeek={week_number}"
    path = link
    if group_id:
        path = path + f"?groupId={group_id}"
    elif staff_id:
        path = path + f"?staffId={staff_id}"
    if group_id or staff_id:
        path = path + f"&selectedWeek={week_number}"
    else:
        path = path + f"?selectedWeek={week_number}"
    response = requests.get(path)
    if response.status_code >= 300:
        print(f"CANNOT PARSE WEEK SCHEDULE FOR GROUP {group_id} week {week_number}")
        return []
    soup = BeautifulSoup(response.text, "html.parser")
    schedule_head = soup.findAll('div', class_="schedule__head")
    schedule_times = soup.findAll('div', class_="schedule__time")
    rows = list()
    heads_list = []
    row_count = 0
    for schedule_head_item in schedule_head:
        schedule__text = schedule_head_item.text[1:] if len(schedule_head_item.text) > 0 else schedule_head_item.text
        schedule__text = "\n".join(schedule__text.split(" "))
        heads_list.append({"text": schedule__text, "id": f"row{row_count}"})
        row_count += 1
    rows.append({"row_data": heads_list})

    for row_id, schedule_time in enumerate(schedule_times):
        day = 0
        sibling = schedule_time.next_sibling
        schedule_time_text = schedule_time.text[1:-1] if len(schedule_time.text) > 0 else schedule_time.text
        list_to_add = [{"text": schedule_time_text, "id": f"row{row_count}"}]
        row_count += 1
        while sibling and 'schedule__time' not in sibling.attrs['class']:
            sibling_text = sibling.text[1:] if len(sibling.text) > 0 else sibling.text
            if len(sibling_text) > 1:
                sibling_soup = BeautifulSoup(str(sibling), "html.parser")
                schedule_place = sibling_soup.findAll("div", class_="schedule__place")
                if schedule_place:
                    schedule_place_text = schedule_place[0].text[1:]
                    sibling_text = sibling_text.replace(schedule_place_text, "  " + schedule_place_text)
            sibling_text = "\n".join(sibling_text.split("  "))
            list_to_add.append({"text": sibling_text, "id": f"row{row_count}"})
            row_count += 1
            sibling = sibling.next_sibling
            day += 1
        rows.append({"row_data": list_to_add})
    return rows


def get_current_week_parse(link="https://ssau.ru/rasp", group_id=None):
    if not group_id:
        with open(r"groups_and_staff.json", "r", encoding='utf-8') as file:
            data = json.loads(file.read())
            groups = data['groups']
            group_id = groups[0]['id']
    path = link + f"?groupId={group_id}"
    response = requests.get(path)
    if response.status_code >= 300:
        print(f"can not parse current week for group {group_id}")
        return None
    soup = BeautifulSoup(response.text, "html.parser")
    current_week = soup.find('span', class_="week-nav-current_week")
    current_week_number = re.findall(r"\d+", current_week.text)
    if len(current_week_number) < 1:
        return None
    # current_week_number = re.match("")
    return current_week_number[0]


if __name__ == "__main__":
    get_week_schedule_by_rows("https://ssau.ru/rasp", 531030143, 15)
    staff_list = get_all_staff("https://ssau.ru/staff", 1, 121)
    faculties = get_all_faculty("https://ssau.ru/rasp")
    all_groups = []
    for faculty_dict in faculties:
        faculty_id = faculty_dict['id']
        groups_and_id = get_groups_id(f"https://ssau.ru/rasp/faculty/{faculty_id}", 1, 7)
        all_groups += groups_and_id
    to_json = {"groups": all_groups, "staff": staff_list}
    with open(r'groups_and_staff.json', 'w', encoding='utf-8') as f:
        json.dump(to_json, f, ensure_ascii=False, indent=4)

