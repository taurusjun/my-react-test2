import { v4 as uuidv4 } from "uuid";

const mdContent = `
# Unit 10 Don't give up Progress Check 2  

Class Name  

I.Complete the dialogue with the expressions in Everyday English on P 79. Jakc: Hey, I'm going to watch a DVD .Do you want to come round to myhouse?  

Nancy: You know we've got a Chemistry test tomorrow, don't you? Jake: I thought it was on Wednesday. Nancy: No, it's tomorrow. .it's the first lesson in the morning Jake: Oh, well, look why don't we relax a bit first and then it'll be easier to do the work later. Do you know what I mean? Nancy: ,no. I've got a better idea. Why don't you bring your Chemistry books over to my house.  

# I1. Turn the following adjectives into adverbs and fill in the blanks. (Each word can onlybe used once)  

<td><table  border="1"><thead><tr><td><b>serious</b></td><td><b>loud</b></td><td><b>patient</b></td><td><b>gentle</b></td><td><b>heavy</b></td></tr></thead><tbody><tr><td>angry</td><td>careless</td><td>sound</td><td>graceful</td><td>sweet</td></tr><tr><td>proud</td><td>polite</td><td>good</td><td>slow</td><td>bitter</td></tr><tr><td>quck</td><td>brave</td><td>fluent</td><td>hungry</td><td>neat</td></tr></tbody></table></td>  

1. That Mathew finished his homework made his father angry.  

2. The girl sang for her parents on their wedding anniversary.  

3.  Little Jessica cried because her beloved cat died.  

4. Veronica did in her examination as she studied hard.  

5. Mr. Black scolded the naughty boy  

6. My father drivers to work.  

7.  Little Vincent showed his'trophy to his parents.  

8. The Spanish girl can speak Japanese in class.  

9. That woman in black walked because she was sick.  

10. Mother told Jenny to write because her handwriting is untidy  

11. The baby is sleeping in the room upstairs.  

12. The world-renowned ballerina danced on thestage.  

13. The soldiers fought to protect their country  

14. The parents clapped and cheered for their children on Sports Day.  

# 上外附中初中英语校本练习EIMBook1  

15. The poor man ate the food  

16. My mother waited for my brother to return home  

17. It rained last night.  

18. Although he was tired, he answered aur qucstions  

19. The nurse treated the patient so thrat his leg would not be painful  

20. The captain was injurcd in the plane crash  

# I. Fill in the blanks with the words in correct form.  

1. Though Mary is of her obcsity problem, she hasn't taken any action to lose any weight. (unconsciously)  

2. Seeing me sitting by the riverside without catching any fish the whole morning, grandfather told me that was his secret to the success of fishing. (patiently)  

3. The immediate blast of an/a can cause casualties by injuring people nearby. (explode)  

4. It is necessary to tell doctors where exactly the is when seeing a doctor, so that they can know what to do. (painful)  

5.  

survive\*3, crash, biology, Peru  

Juliane Koepcke, the only child of Hans- Wilhelm  Koepcke and ornithologist Maria Koepcke, is a German mammalogist.  

When Koepcke was fourteen, her parents left Lima to establish Panguana, a research station in the Amazon rainforest. She became a "jungle child" and learned techniques.  

As a teenager in 1971, Koepcke was the sole of theLANSAFlight 508plane L.She a fall of 3,000 meters, still strapped to her seat She spent eleven days alone in the Amazon rainforest.  

# IV. Fill in the blanks with. The first letter of each blank is given  

# Day 1  

My friend Kayla and I are in the beautiful Swiss Alps. We are climbing to the top of Monte Rosa.It will t three days to go up. We are sleeping in our tents fors at night. We're carrying them in our b  

# Day 2  

We climbed all day. It's a good thing we had food with us. We needed a lot of e to climb in the cold.  

Day 3  

We got to the top today. The v was amazing!Whenwe startedback down, it began to snow. We couldn't see, so we had to stay in one place. I thought  

# 上外附中初中英语校本练习EIMBook1  

we might not s the cold.  

It finallys snowing yesterday, but it was already dark. We started back down in the darkwith 1 on our hats. We finally found a safe place to c .We slept for a few hours, and then we walked down the mountain this morning. Kayla ways that I should write our survival story and P it online!  

# V. Translation  

1.虽然我对生物不是特别感兴趣，但是因为它是一门必修课，我还是很认真的上好每一节课的。（into)  

2.我确信我的女儿Vermessa在美国读书期间会努力学习并且照顾好自己的。她从来都没有让我们失望过。（bet）  

3．Jason 是一个工作狂(workaholic)。他每次头疼就自己吃点阿司匹林，然后就继续工作了。  
`; // 读取 md 文件内容

const mockMdMap = `{
    "10": {
        "uuid": "158b7029-6f18-48af-9297-d3dcd5f4c243",
        "type": "section"
    },
    "11": {
        "uuid": "1b651039-ed6a-4b3c-8518-ff0a406dc36b",
        "type": "question"
    },
    "12": {
        "uuid": "bb9d23ac-05f0-4f85-99c0-03a48f76476d",
        "type": "question_material"
    },
    "14": {
        "uuid": "c4141566-4a66-4aab-921d-7e25249dc971",
        "type": "questionDetail",
        "uiType": "fill_blank"
    },
    "16": {
        "uuid": "6d27f94b-f122-4615-9bb3-f1bbbdfbe550",
        "type": "questionDetail",
        "uiType": "fill_blank"
    },
    "18": {
        "uuid": "ae26e7e5-7e8a-41f3-b21d-41144579536c",
        "type": "questionDetail",
        "uiType": "fill_blank"
    },
    "56": {
        "uuid": "d80f8f4a-8152-4790-a21e-51a2fc94dee4",
        "type": "section"
    },
    "57": {
        "uuid": "35a4f795-a476-48da-bccc-23db1a5abdf3",
        "type": "question"
    },
    "58": {
        "uuid": "7eb02e62-1ec5-4b74-9302-0fe91eaf3564",
        "type": "questionDetail",
        "uiType": "fill_blank"
    },
    "60": {
        "uuid": "cefb4c1f-5f00-483d-8371-ca9baf6e0a86",
        "type": "questionDetail",
        "uiType": "fill_blank"
    }
}`;

// const mockMdMap = {};

const examData = `{
  "uuid":"1fe4eeff-795b-46b8-87b8-7901880ed91c",
  "name":"Unit 10 Don\'t give up Progress Check 2",
  "category":"english",
  "kn":"vocabulary",
  "gradeInfo":{"school":"junior","grade":"grade7"},
  "source":"上外附中初中英语校本练习EIMBook1"
}`;

export const setupFileCorrectionMocks = (mock) => {
  const mockFiles = [
    {
      uuid: "550e8400-e29b-41d4-a716-446655440000",
      name: "文件1",
      createdAt: new Date().toISOString(),
    },
    {
      uuid: "550e8400-e29b-41d4-a716-446655440001",
      name: "文件2",
      createdAt: new Date().toISOString(),
    },
    {
      uuid: "550e8400-e29b-41d4-a716-446655440002",
      name: "文件3",
      createdAt: new Date().toISOString(),
    },
    // ... 添加更多固定的 UUID v4 和名称
  ];

  mock.onGet("/api/file-corrections").reply((config) => {
    const { page = 1, pageSize = 10 } = config.params;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + parseInt(pageSize);
    const paginatedFiles = mockFiles.slice(startIndex, endIndex);
    return [200, { files: paginatedFiles, totalCount: mockFiles.length }];
  });

  // mock.onGet(/\/api\/file-corrections\/.+/).reply((config) => {
  //   const uuid = config.url.split("/").pop();
  //   const file = mockFiles.find((file) => file.uuid === uuid);
  //   if (file) {
  //     return [
  //       200,
  //       { content: mdContent, mdMap: mockMdMap, examData: examData },
  //     ];
  //   } else {
  //     return [404, { message: "文件未找到" }];
  //   }
  // });

  // 添加新的 mock API 用于暂时保存
  mock.onPost(/\/api\/file-corrections\/.+\/temporary-save/).reply((config) => {
    const fileUuid = config.url.split("/")[3]; // 从 URL 中提取 fileUuid
    const { markMap, examData } = JSON.parse(config.data);

    // 检查 fileUuid 是否存在
    const fileExists = mockFiles.some((file) => file.uuid === fileUuid);

    if (!fileExists) {
      return [404, { message: "文件未找到" }];
    }

    // 在实际应用中，这里应该保存 markMap
    // 但在 mock 中，我们只需要返回一个成功响应
    console.log(`Temporary save for file ${fileUuid}:`, markMap, examData);

    return [200, { message: "暂时保存成功" }];
  });

  // 添加新的 mock API 用于提交
  mock.onPost(/\/api\/file-corrections\/.+\/submit/).reply((config) => {
    const fileUuid = config.url.split("/")[3]; // 从 URL 中提取 fileUuid
    const { markMap, examData } = JSON.parse(config.data);

    // 检查 fileUuid 是否存在
    const fileExists = mockFiles.some((file) => file.uuid === fileUuid);

    if (!fileExists) {
      return [404, { message: "文件未找到" }];
    }

    // 在实际应用中，这里应该保存 markMap 和 examData，并进行进一步处理
    // 但在 mock 中，我们只需要返回一个成功响应
    console.log(`Submit for file ${fileUuid}:`, { markMap, examData });

    return [200, { message: "提交成功" }];
  });

  // 添加新的 mock API 用于保存内容
  mock.onPost(/\/api\/file-corrections\/.+\/save-content/).reply((config) => {
    const fileUuid = config.url.split("/")[3]; // 从 URL 中提取 fileUuid
    const { content } = JSON.parse(config.data); // 获取请求体中的内容

    // 检查 fileUuid 是否存在
    const fileExists = mockFiles.some((file) => file.uuid === fileUuid);

    if (!fileExists) {
      return [404, { message: "文件未找到" }];
    }

    // 在实际应用中，这里应该保存内容
    // 但在 mock 中，我们只需要返回一个成功响应
    console.log(`Save content for file ${fileUuid}:`, content);

    return [200, { message: "内容保存成功" }];
  });
};

export default setupFileCorrectionMocks;
